import React from 'react'
import { Link } from 'react-router'
import classNames from 'classnames'

import ComponentContainer from '@appUI/containers/infos-component'
import IconEquipment from '@appUI/components/icon-equipment'

import translate from 'sp-i18n'
import db from '@appLogic/database'
import times from '@appUtils/times'

import { ImportStyle } from 'sp-css-import'
import styles from './slot-equipments.less'

// @connect()
@ImportStyle(styles)
export default class ShipDetailsComponentSlotEquipments extends React.Component {
    render() {
        let renderArr = []
        times(4)(index => {
            const slot = this.props.ship.slot[index]
            const hasSlot = typeof slot !== 'undefined'
            const equipmentId = hasSlot ? this.props.ship.equip[index] : undefined
            const equipment = equipmentId && db.equipments[equipmentId]
            renderArr.push(
                <dl key={index} className={classNames([
                    'item', {
                        disabled: !hasSlot,
                        "is-empty": !equipmentId
                    }
                ])} className={"item" + (!hasSlot ? ' disabled' : '')}>
                    <dt className="slot">{hasSlot ? slot : "-"}</dt>
                    <dd className="equipment">
                        {equipmentId &&
                            <Link to={`/equipments/${equipmentId}`} className="equipment-name">
                                <IconEquipment className="icon" icon={equipment._icon} />
                                {equipment._name}
                            </Link>
                        }
                        {!equipmentId && hasSlot && <span className="equipment-name">
                            <IconEquipment className="icon" />
                            {translate("ship_details.emptyslot")}
                        </span>}
                        {!equipmentId && !hasSlot && <span className="equipment-name">
                            <IconEquipment className="icon" />
                            {translate("ship_details.noslot")}
                        </span>}
                    </dd>
                </dl>
            )
        })
        return (
            <ComponentContainer className={this.props.className} title={translate("ship_details.slot_equipments")}>
                {renderArr}
            </ComponentContainer>
        )
    }
}