import type { Link } from '../../../../../utils/contentful/contentful.types';
import { Link as NavLink } from '@radix-ui/themes';

const Navigation = ({ links }: { links: Array<Link> }) => {
  return (
    <div>
      {links.map(({ fields }, index) => {
        const { contentEntryKey, contentEntry, ...componentProps } = fields;
        return (
          <NavLink key={index} {...componentProps} href={fields.url}>
            {fields.content}
          </NavLink>
        );
      })}
    </div>
  );
};

export default Navigation;
