import { Component, createRef } from 'react';
import { extend } from 'koot';

import db from '@database';
// import bindEvent from 'bind-event'
import {
    changeCollection,
    filterEnter,
    filterLeave,
    filterInput,
    compareEnter,
    compareLeave,
    compareReset,
    compareChangeState,
    // compareSort
} from '@api/ship-list/api.js';
import classNames from 'classnames';

import MainHeader from '@ui/components/main-header';
import Icon from '@ui/components/icon';
// import Button from '@ui/components/button'
// import ButtonGroup from '@ui/components/button-group'
import TableHeader from './table-header';

//

@extend({
    connect: (state, ownProps) => {
        const { isModeCompare, isModeFilter, compareState } =
            state.shipList[ownProps.id] || {};
        return {
            isModeCompare,
            isModeFilter,
            compareState,
        };
    },
    styles: require('./header.less'),
})
class ShipListHeader extends Component {
    state = {
        isClassCompare: false,
    };

    // componentDidMount() {
    //     bindEvent(
    //         this._wrapper.offsetParent,
    //         'animationend',
    //         (evt) => {
    //             if (evt.animationName === 'ship-list-header-compare-leave') {
    //                 this.props.dispatch(
    //                     compareLeave(this.props.id, true)
    //                 )
    //             }
    //         }
    //     )
    // }

    renderExtraButtons() {
        if (!Array.isArray(this.props.extraButtons)) return null;
        return this.props.extraButtons.map((button, index) => {
            switch (button) {
                case 'compare':
                    return (
                        <span
                            className={
                                'link item btn-toggle-compare' +
                                (this.props.isModeCompare ? ' on' : '')
                            }
                            key={index}
                            onClick={() => {
                                if (this.props.isModeCompare)
                                    return this.props.dispatch(
                                        compareReset(this.props.id)
                                    );
                                return this.props.dispatch(
                                    compareEnter(this.props.id)
                                );
                            }}
                        >
                            <Icon
                                className="icon icon-compare"
                                icon="paragraph-left"
                            />
                            {__('ship_list.compare.button')}
                            <Icon className="icon-close" icon="cross" />
                        </span>
                    );
                default:
                    return button;
            }
        });
    }

    onAnimationEnd(evt) {
        if (evt.animationName === 'ship-list-header-compare-leave') {
            this.props.dispatch(compareLeave(this.props.id, true));
        }
    }
    onAnimationEnd = this.onAnimationEnd.bind(this);

    render() {
        return (
            <MainHeader
                data-compare-state={
                    typeof this.props.isModeCompare !== 'undefined'
                        ? this.props.compareState
                        : null
                }
                className={classNames(this.props.className, {
                    'is-filtering': this.props.isModeFilter,
                    'is-compare':
                        typeof this.props.isModeCompare !== 'undefined',
                    'is-compare-leaving': this.props.isModeCompare === false,
                })}
                onAnimationEnd={this.onAnimationEnd}
            >
                <div
                    className="wrapper"
                    // ref={(el) => (this._wrapper = el)}
                >
                    <div className="body">
                        <Filter id={this.props.id} />
                        <Tabs id={this.props.id} />
                        {this.props.extraButtons && (
                            <ExtraButtons>
                                {this.renderExtraButtons()}
                            </ExtraButtons>
                        )}
                    </div>
                    {typeof this.props.isModeCompare !== 'undefined' && (
                        <CompareControls id={this.props.id} />
                    )}
                    {typeof this.props.isModeCompare !== 'undefined' && (
                        <Compare id={this.props.id} />
                    )}
                </div>
            </MainHeader>
        );
    }
}
export default ShipListHeader;

//

@extend({
    connect: (state, ownProps) => ({
        collection: state.shipList[ownProps.id].collection,
    }),
    styles: require('./header-tabs.less'),
})
class Tabs extends Component {
    onTabClick(collection) {
        this.props.dispatch(changeCollection(this.props.id, collection));
    }
    onSelectChange(evt) {
        this.props.dispatch(
            changeCollection(this.props.id, parseInt(evt.target.value))
        );
    }
    onSelectChange = this.onSelectChange.bind(this);
    render() {
        return (
            <div className={this.props.className}>
                <label className="select">
                    <select
                        className="select-select"
                        onChange={this.onSelectChange}
                        value={this.props.collection}
                    >
                        {db.shipCollections.map((collection, index) => (
                            <option key={index} value={index}>
                                {collection.name}
                            </option>
                        ))}
                    </select>
                    {this.props.collection > -1 &&
                        db.shipCollections[this.props.collection].name}
                </label>
                {db.shipCollections.map((collection, index) => (
                    <span
                        key={index}
                        className={
                            'link item' +
                            (this.props.collection === index ? ' on' : '')
                        }
                        onClick={() => {
                            this.onTabClick(index);
                        }}
                    >
                        {collection.name}
                    </span>
                ))}
            </div>
        );
    }
}

// class TabItem extends Component {
//     render() {
//         return (
//             <span
//                 onClick={this.props.onClick}
//                 className={'link item' + this.props.className}
//             >
//                 {this.props.children}
//             </span>
//         )
//     }
// }

//

@extend({
    connect: (state, ownProps) => ({
        filterInput: state.shipList[ownProps.id].filterInput,
    }),
    styles: require('./header-filter.less'),
})
class Filter extends Component {
    InputRef = createRef();

    onInput(evt) {
        if (typeof this.debounceInput !== 'undefined')
            clearTimeout(this.debounceInput);
        const value = evt.target.value;
        this.debounceInput = setTimeout(() => {
            this.props.dispatch(filterInput(this.props.id, value));
        }, 100);
    }
    onInput = this.onInput.bind(this);

    onFocus() {
        this.props.dispatch(filterEnter(this.props.id));
    }
    onFocus = this.onFocus.bind(this);

    onBlur(evt) {
        if (evt.target.value === '') {
            this.props.dispatch(filterLeave(this.props.id));
        }
    }
    onBlur = this.onBlur.bind(this);

    onKeyDown(evt) {
        // const d = {}
        // const a = ['detail', 'eventPhase', 'charCode', 'key', 'keyCode', 'which']
        // a.forEach(k => {
        //     d[k] = evt[k]
        // })
        // console.log(d)
        switch (evt.key) {
            case 'ArrowUp':
            case 'ArrowDown': {
                if (evt.target.value !== '') {
                    evt.preventDefault();
                    evt.target.blur();
                    document.body.dispatchEvent(
                        new KeyboardEvent('keydown', {
                            bubbles: true,
                            keyCode: evt.keyCode,
                        })
                    );
                }
                break;
            }
            case 'Escape': {
                evt.target.blur();
                break;
            }
            default: {
            }
        }
    }
    onKeyDown = this.onKeyDown.bind(this);

    onCloseClick(/*evt*/) {
        const input = this.InputRef.current;
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        // evt.currentTarget.dispatchEvent(new Event('blur', { bubbles: true }))
    }
    onCloseClick = this.onCloseClick.bind(this);

    render() {
        if (typeof this.defaultInput === 'undefined')
            this.defaultInput = this.props.filterInput;
        return (
            <div className={this.props.className}>
                <Icon className="icon-search" icon="search" />
                <span className="btn-close" onClick={this.onCloseClick}>
                    <Icon className="icon-close" icon="cross" />
                </span>
                <input
                    className="input"
                    type="text"
                    placeholder={__('ship_list.filter.placeholder')}
                    onInput={this.onInput}
                    onFocus={this.onFocus}
                    onBlur={this.onBlur}
                    onKeyDown={this.onKeyDown}
                    defaultValue={this.defaultInput}
                    ref={this.InputRef}
                />
            </div>
        );
    }
}

//

@extend({
    styles: require('./header-extra-buttons.less'),
})
class ExtraButtons extends Component {
    render() {
        return (
            <div className={this.props.className}>{this.props.children}</div>
        );
    }
}

//

@extend({
    connect: (state, ownProps) => ({
        // isModeCompare: state.shipList[ownProps.id].isModeCompare,
        compareState: state.shipList[ownProps.id].compareState,
        count: state.shipList[ownProps.id].compareList.length,
    }),
    styles: require('./header-compare-header.less'),
})
class Compare extends Component {
    compareStart() {
        if (__CLIENT__) window.scrollTo(undefined, 0);
        this.props.dispatch(compareChangeState(this.props.id, 'comparing'));
    }
    compareStart = this.compareStart.bind(this);
    compareReset() {
        this.props.dispatch(compareReset(this.props.id));
    }
    render() {
        // <button
        //     type="button"
        //     className="btn-reset"
        //     onClick={this.compareReset.bind(this)}
        // >
        //     <Icon className="icon-close" icon="cross" />
        // </button>
        // {__("ship_list.compare.selected", { count: this.props.compareList.length })}
        return (
            <div className={this.props.className}>
                <div className="selecting">
                    <div className="wrapper">
                        <button
                            type="button"
                            className="btn-start-compare"
                            disabled={!this.props.count}
                            onClick={this.compareStart}
                        >
                            {this.props.count
                                ? __('ship_list.compare.selected_to_start', {
                                      count: this.props.count,
                                  })
                                : __('ship_list.compare.wait_for_selection')}
                        </button>
                    </div>
                </div>
                <div className="comparing">
                    <div className="wrapper">
                        <TableHeader id={this.props.id} />
                    </div>
                </div>
            </div>
        );
    }
}

//

@extend({
    connect: (state, ownProps) => ({
        compareSortType: state.shipList[ownProps.id].compareSort[0],
    }),
    styles: require('./header-compare-controls.less'),
})
class CompareControls extends Component {
    compareReset() {
        if (__CLIENT__) window.scrollTo(undefined, 0);
        this.props.dispatch(compareReset(this.props.id));
    }
    compareReset = this.compareReset.bind(this);
    compareAddRemove() {
        if (__CLIENT__) window.scrollTo(undefined, 0);
        this.props.dispatch(compareChangeState(this.props.id, 'selecting'));
    }
    compareAddRemove = this.compareAddRemove.bind(this);
    // compareResetSort() {
    //     this.props.dispatch(
    //         compareSort(this.props.id, false)
    //     )
    // }
    render() {
        return (
            <div className={this.props.className}>
                <div className="group">
                    <button
                        type="button"
                        className="btn btn-reset"
                        onClick={this.compareReset}
                    >
                        <Icon className="icon" icon="cross" />
                        {__('ship_list.compare.quit')}
                    </button>
                    <button
                        type="button"
                        className="btn btn-modify"
                        onClick={this.compareAddRemove}
                    >
                        <Icon className="icon" icon="stack-check" />
                        {__('ship_list.compare.add_remove')}
                    </button>
                </div>
            </div>
        );
        /* button: sort tip / reset sort
                    <button
                        type="button"
                        className="btn btn-resort"
                        disabled={!this.props.compareSortType}
                        onClick={this.compareResetSort.bind(this)}
                    >
                        {!this.props.compareSortType && <Icon className="icon" icon="sort-amount-desc" />}
                        {!this.props.compareSortType && __("ship_list.compare.click_to_sort")}
                        {this.props.compareSortType && <Icon className="icon" icon="paragraph-left" />}
                        {this.props.compareSortType && __("ship_list.compare.reset_sort")}
                    </button>
        */
    }
}
