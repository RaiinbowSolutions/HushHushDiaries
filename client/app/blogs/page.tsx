import Link from "next/link";

export default function BlogsPage() {
    return (
        <>
            <h1>Blogs</h1>
            
            <Link href={'/blogs/create'} title='Create Blogs'><span className="material-symbols-outlined">menu_book</span></Link>
        </>
    )
}