import { LoginForm } from "./login-form"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
            <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your credentials to access the dashboard
                    </p>
                </div>
                <LoginForm />
            </div>
        </div>
    )
}
