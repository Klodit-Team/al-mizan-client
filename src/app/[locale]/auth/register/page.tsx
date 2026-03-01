import Footer from "@/components/layout/Footer";
import RegisterForm from "@/components/forms/RegisterForm";
import RegisterNavbar from "@/components/layout/RegisterNavbar";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
            <RegisterNavbar />
            <main className="flex-1 w-full max-w-lg mx-auto py-16 px-4">
                <div className="px-8 pb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Operator Registration</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Welcome to the sovereign B2B procurement ecosystem. Register your organization to start participating in tenders.
                    </p>
                </div>
                <RegisterForm />
            </main>
           
        </div>
    );
}
