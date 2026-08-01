import { getAllProducts } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const all = await getAllProducts();
  const products = all.filter(p => p.category_id?.startsWith("jewellery"));
  return <CategoryPage products={products} breadcrumbs={[{name:"Jewellery",href:"/jewellery"}]}/>;
}
