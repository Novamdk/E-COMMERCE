import { Dropdown } from '@/components/ui/Dropdown';
import { QUERY_KEYS, SORT_OPTIONS } from '@/lib/constants';

/**
 * @param {object} props
 * @param {string} props.value
 * @param {(patch: object) => void} props.onFiltersChange
 */
export function SortSelect({ value, onFiltersChange }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="text-content-muted shrink-0 text-sm">
        Sort
      </span>
      <Dropdown
        label="Sort products by"
        options={SORT_OPTIONS}
        value={value}
        onChange={(next) => onFiltersChange({ [QUERY_KEYS.SORT]: next })}
        triggerClassName="min-w-44"
      />
    </div>
  );
}
