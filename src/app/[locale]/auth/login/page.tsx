import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <LoginForm />
            </main>
            <Footer />
        </div>
    );
}
