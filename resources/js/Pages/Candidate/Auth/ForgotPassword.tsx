import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('candidate.password.email'));
    };

    return (
        <GuestLayout
            topRightAction={
                <Link
                    href={route('candidate.login')}
                    className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                >
                    Kembali Login
                </Link>
            }
        >
            <Head title="Lupa Kata Sandi — ARUKarir" />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Lupa Kata Sandi?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Masukkan alamat email Anda untuk menerima link instruksi pemulihan/reset kata sandi.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="contoh@email.com"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <PrimaryButton className="w-full justify-center py-3.5 text-sm font-bold cursor-pointer" disabled={processing}>
                        {processing ? 'Mengirim...' : 'Kirim Link Reset'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
