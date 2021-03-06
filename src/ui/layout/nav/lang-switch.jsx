import { Component, Fragment } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import bindEvent from 'bind-event';
import classNames from 'classnames';
import { extend } from 'koot';

import availableLocales from '@src/locales';

const langName = {
    en: ['EN', 'English'],
    ja: ['日', '日本語'],
    zh: ['简', '简体中文'],
};

@extend({
    connect: (state) => ({
        localeId: state.localeId,
        location: state.routing && state.routing.locationBeforeTransitions,
    }),
    styles: require('./lang-switch.less'),
})
class NavLangSwitch extends Component {
    state = {
        showMenu: false,
    };
    timeoutHideMenu = undefined;

    toggleMenu = this.toggleMenu.bind(this);

    getUrl(thisLocaleId) {
        let search = '';
        const query = { ...this.props.location.query };

        query.hl = thisLocaleId;

        for (const key in query) {
            if (!search) search = '?';
            else search += '&';
            search += `${key}=${query[key]}`;
        }

        return this.props.location.pathname + search;
    }

    componentDidMount() {
        bindEvent(document.body, 'click', () => {
            this.timeoutHideMenu = setTimeout(() => {
                this.setState({
                    showMenu: false,
                });
            }, 10);
        });
    }

    toggleMenu() {
        this.setState((prevState) => ({
            showMenu: !prevState.showMenu,
        }));
        clearTimeout(this.timeoutHideMenu);
    }

    render() {
        return (
            <div className={this.props.className}>
                <span
                    className="link"
                    children={__('nav.languageSwitch')}
                    data-current-locale-abbr={langName[this.props.localeId][0]}
                    onClick={this.toggleMenu}
                />
                <TransitionGroup component={Fragment}>
                    {this.state.showMenu && (
                        <CSSTransition classNames="transition" timeout={200}>
                            <div className="menu">
                                {availableLocales.map((l) => (
                                    <a
                                        href={this.getUrl(l)}
                                        key={l}
                                        children={langName[l][1]}
                                        className={classNames({
                                            'link-lang': true,
                                            on: l === this.props.localeId,
                                        })}
                                    />
                                ))}
                            </div>
                        </CSSTransition>
                    )}
                </TransitionGroup>
            </div>
        );
    }
}
export default NavLangSwitch;
