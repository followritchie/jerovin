import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("men-indo-western");
  return <CategoryPage products={products} breadcrumbs={[{name:"Men",href:"/men"},{name:"Indo Western",href:"/men/indo-western"}]}/>;
}
