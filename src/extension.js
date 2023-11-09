/*
 * Name: Internet Speed Monitor
 * Description: Extension to Monitor Internet Speed and Daily Data Usage minimally.
 * Author: Rishu Raj
 * Modified from: InternetSpeedMeter by Al Shakib
 */

import St from 'gi://St'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import Clutter from 'gi://Clutter'
import Shell from 'gi://Shell'

import * as Main from 'resource:///org/gnome/shell/ui/main.js'
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js'

const schema = 'org.gnome.shell.extensions.InternetSpeedMonitor'
const refreshTime = 1.0 // Set refresh time to one second.
const unitBase = 1024.0 // 1 GB == 1024MB or 1MB == 1024KB etc.
const units = ['K', 'M', 'G', 'T']
/////////////////////////////////////////
let dataused = 0
let lastdataused = 0
let lastdate = ''
let settings
////////////////////////////////////////

let prevUploadBytes = 0,
  prevDownloadBytes = 0
let uploadSpeed = 0.0,
  downloadSpeed = 0.0
let container, netSpeed, defaultNetSpeedText
let timeoutId = 0
let home_dir = GLib.get_home_dir()
let logSize = 8000 // about 8k

export default class InternetSpeedMonitor extends Extension {
  getNetSpeed() {
    try {
      const lines = Shell.get_file_contents_utf8_sync('/proc/net/dev').split('\n')
      let uploadBytes = 0
      let downloadBytes = 0

      for (let i = 0; i < lines.length; ++i) {
        const line = lines[i].trim()
        const column = line.split(/\W+/)
        if (column.length <= 2) continue
        if (
          column[0] != 'lo' &&
          !isNaN(parseInt(column[1])) &&
          !column[0].match(/^br[0-9]+/) &&
          !column[0].match(/^tun[0-9]+/) &&
          !column[0].match(/^tap[0-9]+/) &&
          !column[0].match(/^vnet[0-9]+/) &&
          !column[0].match(/^virbr[0-9]+/)
        ) {
          uploadBytes = uploadBytes + parseInt(column[9])
          downloadBytes = downloadBytes + parseInt(column[1])
        }
      }

      lastdate = settings.get_string('last-save-date')
      lastdataused = settings.get_double('last-data-saved')

      if (prevUploadBytes === 0) {
        prevUploadBytes = uploadBytes
      }
      if (prevDownloadBytes === 0) {
        prevDownloadBytes = downloadBytes
      }
      // Current upload speed
      uploadSpeed = (uploadBytes - prevUploadBytes) / (refreshTime * unitBase)

      // Current download speed
      downloadSpeed = (downloadBytes - prevDownloadBytes) / (refreshTime * unitBase)

      // Total internet used
      dataused = (uploadBytes + downloadBytes) / unitBase

      // Reset data used if necessary
      const date = new Date().toLocaleDateString()
      if (date != lastdate || dataused < lastdataused) {
        this.resetLastData(date)
      }

      // Show upload + download = total speed on shell
      let finaltext = ''
      if (settings.get_boolean('separate-format')) {
        if (settings.get_boolean('separate-format-flipped')) {
          finaltext += '↓ ' + this.netSpeedFormat(downloadSpeed) + ' ↑ ' + this.netSpeedFormat(uploadSpeed)
        } else {
          finaltext += '↑ ' + this.netSpeedFormat(uploadSpeed) + ' ↓ ' + this.netSpeedFormat(downloadSpeed)
        }
      } else {
        finaltext += '⇅ ' + this.netSpeedFormat(uploadSpeed + downloadSpeed)
      }

      if (settings.get_boolean('show-data-used')) {
        finaltext += ' = ' + this.netSpeedFormat(dataused - lastdataused)
      }
      netSpeed.set_text(finaltext)
      // netSpeed.set_text("↑ " + this.netSpeedFormat(uploadSpeed) + " ↓ " + this.netSpeedFormat(downloadSpeed) + " = " + this.netSpeedFormat(dataused - lastdataused) + " ");
      prevUploadBytes = uploadBytes
      prevDownloadBytes = downloadBytes
    } catch (e) {
      netSpeed.set_text(defaultNetSpeedText + ' ' + e)
      this.saveExceptionLog(e)
    }
    return true
  }

  netSpeedFormat(speed) {
    let i = 0
    while (speed >= unitBase) {
      // Convert speed to KB, MB, GB or TB
      speed /= unitBase
      i++
    }
    return String(speed.toFixed(2) + '' + units[i])
  }

  saveExceptionLog(e) {
    let log_file = Gio.file_new_for_path(home_dir + '/.local/var/log/InternetSpeedMonitor.log')

    let log_file_size = log_file.query_info('standard::size', 0, null).get_size()

    if (log_file_size > logSize) {
      log_file.replace(null, false, 0, null).close(null)
    }
    e += Date() + ':\n' + e
    let logOutStream = log_file.append_to(1, null)
    logOutStream.write(e, null)
    logOutStream.close(null)
  }

  resetLastData(d) {
    settings.set_string('last-save-date', d)
    settings.set_double('last-data-saved', dataused)
  }

  init() {}

  enable() {
    container = new St.Bin({
      style_class: 'panel-button',
      reactive: true,
      can_focus: false,
      x_expand: true,
      y_expand: false,
      track_hover: false,
    })
    defaultNetSpeedText = '⇅ --'
    netSpeed = new St.Label({
      text: defaultNetSpeedText,
      style_class: 'netSpeedLabel',
      y_align: Clutter.ActorAlign.CENTER,
    })
    container.set_child(netSpeed)
    settings = this.getSettings(schema)
    // log("Starting with used_data set as "+settings.get_boolean('show-data-used')+" separate-format as "+ settings.get_boolean('separate-format')+" in "+settings.get_enum('my-position')+" side.");
    // Positioning and Starting the extension
    if (settings.get_boolean('pos-left')) {
      Main.panel._leftBox.insert_child_at_index(container, 20)
    } else {
      Main.panel._rightBox.insert_child_at_index(container, 0)
    }

    timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, refreshTime, this.getNetSpeed.bind(this))
  }

  disable() {
    if (timeoutId != 0) {
      GLib.Source.remove(timeoutId)
      timeoutId = 0
    }

    if (container != null) {
      Main.panel._leftBox.remove_child(container)
      container.destroy()
      container = null
      settings = null
    }
  }
}
