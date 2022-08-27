'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
// const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function buildPrefsWidget() {

    // Copy the same GSettings code from `extension.js`
    this.settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.InternetSpeedMonitor');

    // Create a parent widget that we'll return from this function
    let prefsWidget = new Gtk.Grid({
        // margin: 18,
        margin_start: 40,
        margin_end: 40,  
        margin_top: 40,
        margin_bottom: 40,
        column_spacing: 20,
        row_spacing: 12,
        visible: true
    });

///////////////////////////  1st switch
    // Create a label & switch for `data usage`
    let dataUsedLabel = new Gtk.Label({
        label: '<b>Show Data Usage:</b> (since midnight).',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(dataUsedLabel, 0, 1, 1, 1);

    let dataUsedToggle = new Gtk.Switch({
        active: this.settings.get_boolean ('show-data-used'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(dataUsedToggle, 1, 1, 1, 1);

    // Bind the switch to the `show-indicator` key
    this.settings.bind(
        'show-data-used',
        dataUsedToggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

///////////////////////////  2nd switch
    // Create a label & switch for `format`
    let showSeparatelyLabel = new Gtk.Label({
        label: '<b>Show Upload and Download speeds separately:</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(showSeparatelyLabel, 0, 2, 1, 1);

    let showSeparatelytoggle = new Gtk.Switch({
        active: this.settings.get_boolean ('separate-format'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(showSeparatelytoggle, 1, 2, 1, 1);

    // Bind the switch to the `show-indicator` key
    this.settings.bind(
        'separate-format',
        showSeparatelytoggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );

///////////////////////////  3nd switch
    // Create a label & switch for `positioning`
    let positioningLabel = new Gtk.Label({
        label: '<b>Show the extension on the left side:</b> (restart the extension for changes to appear)',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(positioningLabel, 0, 3, 1, 1);

    let positioningtoggle = new Gtk.Switch({
        active: this.settings.get_boolean ('pos-left'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(positioningtoggle, 1, 3, 1, 1);

    // Bind the switch to the `show-indicator` key
    this.settings.bind(
        'pos-left',
        positioningtoggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );


///////////////////////////  4th switch
    // Create a label & switch for `format`
    let showSeparatelyFlippedLabel = new Gtk.Label({
        label: '<b>Flip Upload and Download speeds locations:</b>',
        halign: Gtk.Align.START,
        use_markup: true,
        visible: true
    });
    prefsWidget.attach(showSeparatelyFlippedLabel, 0, 4, 1, 1);

    let showSeparatelyFlippedtoggle = new Gtk.Switch({
        active: this.settings.get_boolean ('separate-format-flipped'),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    prefsWidget.attach(showSeparatelyFlippedtoggle, 1, 4, 1, 1);

    // Bind the switch to the `show-indicator` key
    this.settings.bind(
        'separate-format-flipped',
        showSeparatelyFlippedtoggle,
        'active',
        Gio.SettingsBindFlags.DEFAULT
    );





///////////////////////////  Reset Button

    let resetButton = new Gtk.Button({
        label: "Reset Data Usage",
        visible: true
    });
    resetButton.connect('clicked', () => {
        this.settings.set_string('last-save-date',"random");
    });
    prefsWidget.attach(resetButton, 0, 5, 2, 1);

    // Return our widget which will be added to the window
    return prefsWidget;
}