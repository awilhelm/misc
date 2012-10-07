function enable() {}
function disable() {}
function init() {


/***********************************************************************
	ANIMATIONS PLUS RAPIDES
***********************************************************************/

	imports.gi.St.set_slow_down_factor(0.75);


/***********************************************************************
	ICÔNES DE STATUS DANS LE PANNEAU PLUTÔT QUE DANS LA BARRE DE MESSAGES
***********************************************************************/

	function show_in_panel(x) {
		imports.ui.statusIconDispatcher.STANDARD_TRAY_ICON_IMPLEMENTATIONS[x] = x;
	}

	['pidgin'].forEach(show_in_panel);


/***********************************************************************
	PAS D'ICÔNE INUTILE DANS LE PANNEAU
***********************************************************************/

	function hide_from_panel(x) {
		imports.ui.main.panel._statusArea[x].actor.hide()
	}

	['a11y'].forEach(hide_from_panel);
	imports.ui.main.panel._statusArea.userMenu._name.hide();


/***********************************************************************
	TITRE DE LA FENÊTRE DANS LE PANNEAU
***********************************************************************/

	function set_menu_label() {
		if(window) {
			window.disconnect(connection)
		}
		window = global.display.focus_window
		imports.ui.main.panel._appMenu._label.setText(tracker.get_window_app(window).get_name() + ' - ' + window.title)
		connection = window.connect('notify::title', set_menu_label)
	}

	let window = undefined
	let connection = undefined
	let tracker = imports.gi.Shell.WindowTracker.get_default()
	tracker.connect('notify::focus-app', set_menu_label)


/**/}
