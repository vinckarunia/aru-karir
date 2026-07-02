import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hr.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login HR — ARUKarir" />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Login Recruiter / Admin</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Gunakan akun HR/Admin untuk mengelola lowongan dan rekrutmen.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Address */}
                <div>
                    <InputLabel htmlFor="email" value="Email Perusahaan" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nama@aru.co.id"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-slate-600 dark:text-slate-400 font-semibold">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                {/* Submit button */}
                <div>
                    <PrimaryButton className="w-full justify-center py-3.5 text-sm font-bold cursor-pointer" disabled={processing}>
                        {processing ? 'Memverifikasi...' : 'Masuk ke Portal HR'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
