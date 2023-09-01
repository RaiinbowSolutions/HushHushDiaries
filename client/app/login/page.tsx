import { Login } from "@/components/login";

export default function LoginPage() {
    return (
        <>
            <h1>Login</h1>
            <form onSubmit={Login}>
                <label htmlFor="email">Email:</label>
                <input type="email" name="email" placeholder="Type email" />
                <label htmlFor="password">Password:</label>
                <input type="password" name="password" placeholder="Type password" />
                <button type="submit">Login</button>
            </form>
        </>
    )
}