import React from 'react'
import { Link } from 'react-router'
import db from 'Logic/database'

import { ImportStyle } from 'sp-css-import'
import style from './link-ship.less'

@ImportStyle(style)
export default class LinkShip extends React.Component {
    renderAvatar() {
        return (
            <img className="avatar" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAoCAQAAADTJTkTAAAATElEQVR42u3QMQEAAAgDoC2Z/VsZwscDItBMOKhAgQIFCkSgQIECEShQoEAEChQoEIECBQpEoECBAhEoUKBABAoUKBCBAgUKRKDAHxY6hwoBYQTrnwAAAABJRU5ErkJggg==" />
        )
    }

    renderName() {
        return (
            <span className="name">
                {this.props.ship.getNameNoSuffix()}
                {this.props.ship.name.suffix && (<small className="name-suffix">{this.props.ship.getSuffix()}</small>)}
            </span>
        )
    }

    render() {
        if (typeof this.props.ship === 'string')
            this.props.ship = parseInt(this.props.ship)
        if (typeof this.props.ship === 'number')
            this.props.ship = db.ships[this.props.ship]

        console.log(this.props.className)
        return (
            <Link
                className={this.props.className}
                to={'/ships/' + this.props.ship.id}
                onClick={this.props.onClick}
            >
                {this.renderName()}
                {this.renderAvatar()}
                {this.props.children}
            </Link>
        )
    }
}