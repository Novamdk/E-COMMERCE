/**
 * Public surface of the catalog feature. Other features and pages import from
 * here; nothing reaches into ./components or ./hooks from outside.
 */
export { ProductCard } from './components/ProductCard';
export { ProductCardSkeleton } from './components/ProductCardSkeleton';
export { ProductGrid } from './components/ProductGrid';
export { ProductCarousel } from './components/ProductCarousel';
export { Filters } from './components/Filters';
export { SortSelect } from './components/SortSelect';
export { SearchField } from './components/SearchField';
export { ActiveFilterChips } from './components/ActiveFilterChips';
export { Gallery } from './components/Gallery';
export { ProductBreadcrumbs } from './components/ProductBreadcrumbs';
export { VariantPicker } from './components/VariantPicker';
export { ProductPurchasePanel } from './components/ProductPurchasePanel';
export { RelatedProducts } from './components/RelatedProducts';
export { useProducts } from './hooks/useProducts';
export { useProductFilters } from './hooks/useProductFilters';
