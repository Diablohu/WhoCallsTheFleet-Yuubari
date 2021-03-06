import { memo } from 'react';
import { extend } from 'koot';

const ImprovementStar = extend({
    styles: require('./styles.less'),
})(
    memo(({ star, level, lvl, children, ...props }) => (
        <span
            {...props}
            data-star={star || level || lvl}
            children={'★+' + (star || level || lvl || children)}
        />
    ))
);

export default ImprovementStar;
