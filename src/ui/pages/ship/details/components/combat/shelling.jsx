import Basic from './_basic';

export default ({ ship }) => (
    <Basic
        ship={ship}
        capabilityName={__('combat_phases.day.shelling')}
        capabilityKey="shelling"
    />
);
