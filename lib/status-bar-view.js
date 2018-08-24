const {CompositeDisposable, Disposable, Emitter} = require('via');
const etch = require('etch');
const UpdateManager = require('./update-manager');
const $ = etch.dom;

module.exports = class UpdateStatusView {
    constructor({version}){
        etch.initialize(this);

        this.disposables = new CompositeDisposable(
            via.tooltips.add(this.element, {title: `Version ${version} will be installed the next time Via is launched.`})
        );
    }

    render(){
        return $.div({classList: `welcome-update-available toolbar-button`},
            $.div({class: 'welcome-update-status-icon'}),
            $.div({classList: 'welcome-update-status-message'}, 'Update Available')
        );
    }

    update(){
        etch.update(this);
    }

    destroy(){
        this.disposables.dispose();
    }
}
