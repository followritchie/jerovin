import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("jewellery-earrings");
  return <CategoryPage products={products} breadcrumbs={[{name:"Jewellery",href:"/jewellery"},{name:"Earrings",href:"/jewellery/earrings"}]}/>;
}
