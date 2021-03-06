import checkShipCapability from '@api/check-ship-capability';
import Bullet from '@ui/components/bullet';
import Requirements from './_requirements';

export default ({
    ship,
    capabilityName,
    capabilityKey,
    equipments,
    children,
}) => {
    const able = checkShipCapability(ship, capabilityKey, equipments);
    let level = 0;
    if (able === true) {
        level = 'always';
    } else if (able && typeof able.equipments === 'object') {
        level = 'indeterminate';
    }
    return (
        <Bullet title={capabilityName} level={level}>
            {level === 'indeterminate' && able && (
                <Requirements requirements={able} ship={ship} />
            )}
            {children}
        </Bullet>
    );
};
