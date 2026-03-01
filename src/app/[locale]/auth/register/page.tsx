import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/forms/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <RegisterForm />
            </main>
            <Footer />
        </div>
    );
}
