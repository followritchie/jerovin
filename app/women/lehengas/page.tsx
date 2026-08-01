import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("women-lehengas");
  return <CategoryPage products={products} breadcrumbs={[{name:"Women",href:"/women"},{name:"Lehengas",href:"/women/lehengas"}]}/>;
}
