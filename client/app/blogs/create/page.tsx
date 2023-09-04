import * as createBlog from "@/components/createBlog";

export default function CreateBlog() {
    return (
        <>
            <h1>Create blog</h1>
            <form onSubmit={createBlog.CreateBlog}>
                <label htmlFor="title">Title</label>
                <input type="text" name="title" placeholder="Input title"/>
                <br />
                <label htmlFor="author_id">Author</label>
                <input type="text" name="author" placeholder="Input author" />
                <br />
                <label htmlFor="category_id">Category</label>
                <input list="categories" name="category" id="category" placeholder="Choose category" />
                <label htmlFor="keywords">Keywords</label>
                <input type="text" name="keywords" placeholder="Enter keywords" />
                <br />
                <label htmlFor="description">Description</label>
                <input type="text" name="description" placeholder="Input description" />
                <br />
                <label htmlFor="content">Content</label>
                <input type="text" name="content" placeholder="Input content" />
                
                <datalist id="categories">
                    <option value={'Test'} />
                    <option value={'Test 2'} />
                    <option value={'Test 3'} />
                </datalist>
            </form>
        </>
    )
}