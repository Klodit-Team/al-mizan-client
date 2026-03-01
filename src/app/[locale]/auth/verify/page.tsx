import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VerifyForm from "@/components/forms/VerifyForm";

export default function VerifyPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                <VerifyForm />
            </main>
            <Footer />
        </div>
    );
}
