"use babel";
/** @jsx etch.dom */

const {CompositeDisposable, Disposable} = require('via');
const etch = require('etch');
const base = 'via://welcome';

module.exports = class WelcomeView {
    constructor(){
        this.disposables = new CompositeDisposable();

        etch.initialize(this);

        this.disposables.add(
            via.tooltips.add(this.refs.slack, {title: 'Join Us On Slack'}),
            via.tooltips.add(this.refs.telegram, {title: 'Chat On Telegram'}),
            via.tooltips.add(this.refs.twitter, {title: 'Follow Us On Twitter'}),
            via.tooltips.add(this.refs.reddit, {title: 'Join Our Subreddit'})
        );
    }

    render(){
        return (
            <div className='welcome'>
                <div className='thead'>
                    <div className='td'>Version {via.getVersion()}</div>
                    <div className='td'>©2018 Via Systems, LLC</div>
                </div>
                <div className='welcome-body'>
                    <div className='logo'></div>
                    <div className='version'>Version {via.getVersion()}</div>
                    <div className='social links'>
                        <div ref='slack' className='link slack' onclick={() => this.didClickSocial('slack')}></div>
                        <div ref='telegram' className='link telegram' onclick={() => this.didClickSocial('telegram')}></div>
                        <div ref='twitter' className='link twitter' onclick={() => this.didClickSocial('twitter')}></div>
                        <div ref='reddit' className='link reddit' onclick={() => this.didClickSocial('reddit')}></div>
                    </div>
                    <div className='title'>
                        {`Thanks for using Via. If you're just getting started, things may look a little empty, so we've put together
                        some helpful links to get you up and running as quickly as possible. Choose from the options below to get
                        some basic functionality, or read the guides to learn about everything that Via can do. Don't hesistate
                        to reach out if you encounter any issues.`}
                    </div>
                    <div className='links'>
                        <div className='link btn' onclick={this.didClickGuides}>Check Out The Guides</div>
                        <div className='link btn' onclick={this.didClickAddTradingAccount}>Add A Trading Account</div>
                        <div className='link btn' onclick={this.didClickCustomize}>Customize the UI</div>
                    </div>
                    <div className='preference'>
                        <label>
                            <input className='input-checkbox' type='checkbox' checked={via.config.get('welcome.showOnStartup')} onchange={this.didChangeShowOnStartup} />
                            Show this page on startup
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    destroy(){
        this.disposables.dispose();
        etch.destroy(this);
    }

    update(){}

    didChangeShowOnStartup(){
        via.config.set('welcome.showOnStartup', this.checked);
    }

    didClickAddTradingAccount(){
        via.workspace.open('via://settings/accounts');
    }

    didClickCustomize(){
        via.applicationDelegate.openExternal('https://docs.via.world/terminal/customizing-your-interface');
    }

    didClickGuides(){
        via.applicationDelegate.openExternal('https://docs.via.world');
    }

    didClickSocial(network){
        let url;

        if(network === 'slack') url = 'https://slack.via.world';
        if(network === 'telegram') url = 'https://t.me/viaplatform';
        if(network === 'twitter') url = 'https://twitter.com/viaplatform';
        if(network === 'reddit') url = 'https://reddit.com/r/viaplatform';

        via.applicationDelegate.openExternal(url);
    }

    getTitle(){
        return 'Welcome';
    }

    getURI(){
        return base;
    }
}
