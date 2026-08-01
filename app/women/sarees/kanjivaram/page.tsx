import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("women-sarees-kanjivaram");
  return <CategoryPage products={products} breadcrumbs={[{name:"Women",href:"/women"},{name:"Sarees",href:"/women/sarees"},{name:"Kanjivaram Silk Sarees",href:"/women/sarees/kanjivaram"}]}/>;
}
