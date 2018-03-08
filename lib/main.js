const {CompositeDisposable, Disposable} = require('via');
const WelcomeView = require('./welcome-view');
const base = 'via://welcome';

class WelcomePackage {
    activate(){
        this.disposables = new CompositeDisposable();
        this.welcome = null;

        this.disposables.add(via.commands.add('via-workspace', 'welcome:show', () => via.workspace.open(base)));

        this.disposables.add(via.workspace.addOpener(uri => {
            if(uri === base) return this.create();
        }));

        if(via.config.get('welcome.showOnStartup')){
            this.show();
        }
    }

    create(){
        if(!this.welcome){
            this.welcome = new WelcomeView();
        }

        return this.welcome;
    }

    show(){
        return via.workspace.open(base);
    }

    deactivate(){
        if(this.welcome) this.welcome.destroy();
        this.disposables.dispose();
    }
}

module.exports = new WelcomePackage();
