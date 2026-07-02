import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

interface Props {
    job?: string;
}

export default function Login({ job }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        job: job || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('candidate.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            topRightAction={
                <Link
                    href={route('candidate.register', job ? { job } : undefined)}
                    className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                >
                    Daftar Akun Baru
                </Link>
            }
        >
            <Head title="Login Kandidat — ARUKarir" />

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Masuk ke ARUKarir</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Masuk untuk melamar pekerjaan dan melacak status lamaran Anda.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Address */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="contoh@email.com"
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                {/* Password */}
                <div>
                    <div className="flex justify-between items-center">
                        <InputLabel htmlFor="password" value="Kata Sandi" />
                        <Link
                            href={route('candidate.password.request')}
                            className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
                        >
                            Lupa Kata Sandi?
                        </Link>
                    </div>
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
                        {processing ? 'Memproses...' : 'Masuk Sekarang'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
