import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("jewellery-pendants");
  return <CategoryPage products={products} breadcrumbs={[{name:"Jewellery",href:"/jewellery"},{name:"Pendants",href:"/jewellery/pendants"}]}/>;
}
