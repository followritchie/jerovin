import { getProductsByCategory } from "@/app/lib/products";
import CategoryPage from "@/app/components/CategoryPage";
export const revalidate = 0;
export default async function Page() {
  const products = await getProductsByCategory("men-sherwanis");
  return <CategoryPage products={products} breadcrumbs={[{name:"Men",href:"/men"},{name:"Sherwanis",href:"/men/sherwanis"}]}/>;
}
