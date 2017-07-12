import React from 'react'

import IconStat from 'UI/components/icon-stat'

import { ImportStyle } from 'sp-css-import'
import styles from './stat.less'

// @connect()
@ImportStyle(styles)
export default class ShipDetailsStat extends React.Component {
    render() {
        const type = this.props.type || this.props.title
        const Component = this.props.stat ? IconStat : 'dl'
        let componentProps = {
            className: this.props.className
        }
        if (this.props.stat) {
            componentProps.tag = "dl"
            componentProps.stat = this.props.stat
        }
        return (
            <Component {...componentProps}>
                {type && <dt className="type">{type}</dt>}
                <dd className="value">
                    {this.props.children}
                </dd>
            </Component>
        )
    }
}