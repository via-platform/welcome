const {CompositeDisposable, Disposable} = require('via');
const semver = require('semver');
const WelcomeView = require('./welcome-view');
const UpdateManager = require('./update-manager');
const StatusBarView = require('./status-bar-view');
const AvailableUpdateVersion = 'welcome:version-available';
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

        this.updateManager = new UpdateManager();

        const availableVersion = window.localStorage.getItem(AvailableUpdateVersion);

        if(via.getReleaseChannel() === 'dev' || (availableVersion && semver.lte(availableVersion, via.getVersion()))) {
            this.clearUpdateState();
        }

        this.disposables.add(this.updateManager.onDidChange(() => {
            if(this.updateManager.getState() === this.updateManager.state.UpdateAvailableToInstall){
                window.localStorage.setItem(AvailableUpdateVersion, this.updateManager.getAvailableVersion());
                this.showStatusBarViewIfNeeded();
            }
        }));

        this.disposables.add(via.commands.add('via-workspace', 'welcome:clear-update-state', () => {
            this.clearUpdateState();
        }));

        console.log('88888')
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

        if(this.updateManager){
            this.updateManager.dispose();
            this.updateManager = undefined;
        }
    }

    consumeStatusBar(statusBar){
        this.statusBar = statusBar;
        this.showStatusBarViewIfNeeded();
    }

    isUpdateAvailable(){
        const availableVersion = window.localStorage.getItem(AvailableUpdateVersion);
        return availableVersion && semver.gt(availableVersion, via.getVersion());
    }

    clearUpdateState(){
        window.localStorage.removeItem(AvailableUpdateVersion);
    }

    showStatusBarViewIfNeeded(){
        if(this.isUpdateAvailable() && this.statusBar){
            if(this.statusBarTile){
                this.statusBarTile.destroy();
            }

            this.statusBarTile = this.statusBar.addRightTile({
                item: new StatusBarView({version: this.updateManager.getAvailableVersion()}),
                priority: -100
            });

            return this.statusBarTile;
        }
    }
}

module.exports = new WelcomePackage();
