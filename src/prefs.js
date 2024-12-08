'use strict'

import Gio from 'gi://Gio'
import Gtk from 'gi://Gtk'

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

const schema = 'org.gnome.shell.extensions.InternetSpeedMonitor'
let settings

export default class InternetSpeedMonitorPreferences extends ExtensionPreferences {
  getPreferencesWidget() {
    // Create a settings object
    settings = this.getSettings(schema)

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Grid({
      margin_start: 40,
      margin_end: 40,
      margin_top: 40,
      margin_bottom: 40,
      column_spacing: 20,
      row_spacing: 12,
      visible: true,
    })

    ///////////////////////////  1st switch
    // Create a label & switch for `data usage`
    let dataUsedLabel = new Gtk.Label({
      label: '<b>Show Data Usage:</b> (since midnight).',
      halign: Gtk.Align.START,
      use_markup: true,
      visible: true,
    })
    prefsWidget.attach(dataUsedLabel, 0, 1, 1, 1)

    let dataUsedToggle = new Gtk.Switch({
      active: settings.get_boolean('show-data-used'),
      halign: Gtk.Align.END,
      hexpand: true,
      visible: true,
    })
    prefsWidget.attach(dataUsedToggle, 1, 1, 1, 1)

    // Bind the switch to the `show-indicator` key
    settings.bind('show-data-used', dataUsedToggle, 'active', Gio.SettingsBindFlags.DEFAULT)

    ///////////////////////////  2nd switch
    // Create a label & switch for `format`
    let showSeparatelyLabel = new Gtk.Label({
      label: '<b>Show Upload and Download speeds separately:</b>',
      halign: Gtk.Align.START,
      use_markup: true,
      visible: true,
    })
    prefsWidget.attach(showSeparatelyLabel, 0, 2, 1, 1)

    let showSeparatelytoggle = new Gtk.Switch({
      active: settings.get_boolean('separate-format'),
      halign: Gtk.Align.END,
      hexpand: true,
      visible: true,
    })
    prefsWidget.attach(showSeparatelytoggle, 1, 2, 1, 1)

    // Bind the switch to the `show-indicator` key
    settings.bind('separate-format', showSeparatelytoggle, 'active', Gio.SettingsBindFlags.DEFAULT)

    ///////////////////////////  3nd switch
    // Create a label & switch for `positioning`
    let positioningLabel = new Gtk.Label({
      label: '<b>Show the extension on the left side:</b>\n(restart the extension for changes to appear)',
      halign: Gtk.Align.START,
      use_markup: true,
      visible: true,
    })
    prefsWidget.attach(positioningLabel, 0, 3, 1, 2)

    let positioningtoggle = new Gtk.Switch({
      active: settings.get_boolean('pos-left'),
      halign: Gtk.Align.END,
      hexpand: true,
      visible: true,
    })
    prefsWidget.attach(positioningtoggle, 1, 3, 1, 1)

    // Bind the switch to the `show-indicator` key
    settings.bind('pos-left', positioningtoggle, 'active', Gio.SettingsBindFlags.DEFAULT)

    ///////////////////////////  4th switch
    // Create a label & switch for `format`
    let showSeparatelyFlippedLabel = new Gtk.Label({
      label: '<b>Flip Upload and Download speeds locations:</b>',
      halign: Gtk.Align.START,
      use_markup: true,
      visible: true,
    })
    prefsWidget.attach(showSeparatelyFlippedLabel, 0, 5, 1, 1)

    let showSeparatelyFlippedtoggle = new Gtk.Switch({
      active: settings.get_boolean('separate-format-flipped'),
      halign: Gtk.Align.END,
      hexpand: true,
      visible: true,
    })
    prefsWidget.attach(showSeparatelyFlippedtoggle, 1, 5, 1, 1)

    // Bind the switch to the `show-indicator` key
    settings.bind('separate-format-flipped', showSeparatelyFlippedtoggle, 'active', Gio.SettingsBindFlags.DEFAULT)

    ///////////////////////////  Reset Button

    let resetButton = new Gtk.Button({
      label: 'Reset Data Usage',
      visible: true,
    })
    resetButton.connect('clicked', () => {
      settings.set_string('last-save-date', 'random')
    })
    prefsWidget.attach(resetButton, 0, 6, 2, 1)

    // Return our widget which will be added to the window
    return prefsWidget
  }
}
