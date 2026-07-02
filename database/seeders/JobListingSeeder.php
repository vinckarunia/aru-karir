<?php

namespace Database\Seeders;

use App\Models\HrUser;
use App\Models\JobCategory;
use App\Models\JobListing;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class JobListingSeeder extends Seeder
{
    public function run(): void
    {
        $hr = HrUser::where('email', 'hr@aru.co.id')->first() ?? HrUser::first();
        if (!$hr) return;

        $jobs = [
            [
                'title' => 'Operator Alat Berat',
                'description' => "Kami mencari Operator Alat Berat berpengalaman untuk mengoperasikan Excavator dan Bulldozer pada proyek konstruksi perumahan klien kami di area Tangerang.\n\nTanggung Jawab:\n- Mengoperasikan unit Excavator/Bulldozer dengan aman dan efisien sesuai standar K3.\n- Melakukan perawatan rutin harian sebelum dan sesudah pengoperasian unit.\n- Berkoordinasi dengan Pengawas Lapangan terkait target kerja harian.\n- Menjaga kebersihan dan keamanan unit yang dioperasikan.",
                'requirements' => "Kualifikasi:\n- Pendidikan minimal SMA/SMK sederajat.\n- Memiliki SIO (Surat Izin Operator) Excavator/Bulldozer yang masih aktif.\n- Pengalaman minimal 2 tahun sebagai operator di proyek konstruksi/infrastruktur.\n- Disiplin, jujur, dan memiliki komitmen tinggi terhadap keselamatan kerja K3.\n- Bersedia ditempatkan di site Tangerang.",
                'location' => 'Tangerang',
                'contract_type' => 'pkwt',
                'salary_range_min' => 4500000,
                'salary_range_max' => 5500000,
                'salary_visible' => true,
                'quota' => 3,
                'deadline_at' => now()->addDays(30),
                'status' => 'published',
                'categories' => ['Operator'],
            ],
            [
                'title' => 'Teknisi Listrik & AC',
                'description' => "Dibutuhkan segera Teknisi AC & Elektrikal gedung untuk pemeliharaan rutin dan penanganan gangguan sistem kelistrikan serta unit pendingin ruangan (AC) di kantor pusat mitra kami.\n\nTanggung Jawab:\n- Melakukan preventif maintenance berkala untuk sistem kelistrikan gedung (panel, fitting, genset).\n- Melakukan servis, pengisian freon, dan perbaikan kerusakan unit AC split maupun central.\n- Merespon dengan cepat panggilan troubleshooting/kerusakan dari user.\n- Membuat laporan harian terkait pekerjaan pemeliharaan yang telah dilakukan.",
                'requirements' => "Kualifikasi:\n- Lulusan SMK Jurusan Teknik Ketenagalistrikan / Teknik Pendingin dan Tata Udara.\n- Pengalaman minimal 1-2 tahun di bidang maintenance gedung / teknisi AC.\n- Memahami gambar kelistrikan (single line diagram) dan troubleshooting rangkaian kontrol listrik.\n- Mampu bekerja secara mandiri maupun dalam tim.\n- Penempatan kerja di Jakarta Selatan.",
                'location' => 'Jakarta Selatan',
                'contract_type' => 'pkwt',
                'salary_range_min' => 4000000,
                'salary_range_max' => 5000000,
                'salary_visible' => true,
                'quota' => 2,
                'deadline_at' => now()->addDays(20),
                'status' => 'published',
                'categories' => ['Teknisi'],
            ],
            [
                'title' => 'Staff Administrasi Proyek',
                'description' => "Menangani pencatatan dokumen, administrasi keuangan lapangan, absensi pekerja, serta pelaporan logistik material proyek konstruksi.\n\nTanggung Jawab:\n- Melakukan pencatatan administrasi logistik material masuk dan keluar proyek.\n- Mengelola absensi pekerja harian dan mempersiapkan berkas pembayaran gaji mingguan.\n- Menyusun laporan administrasi harian dan mingguan untuk diserahkan ke Project Manager.\n- Mengarsipkan dokumen surat menyurat proyek secara rapi dan terorganisir.",
                'requirements' => "Kualifikasi:\n- Pendidikan minimal D3/S1 semua jurusan (Administrasi/Akuntansi lebih disukai).\n- Menguasai Microsoft Office (Excel, Word, Outlook) dengan baik.\n- Teliti, rapi dalam administrasi, dan memiliki komunikasi yang baik.\n- Mampu bekerja di bawah tekanan jadwal proyek.\n- Penempatan di Bekasi.",
                'location' => 'Bekasi',
                'contract_type' => 'pkwtt',
                'salary_range_min' => 4200000,
                'salary_range_max' => 4800000,
                'salary_visible' => false,
                'quota' => 1,
                'deadline_at' => now()->addDays(15),
                'status' => 'published',
                'categories' => ['Staff Admin'],
            ],
            [
                'title' => 'Security Officer (Mitra Bank)',
                'description' => "Menjaga keamanan dan ketertiban area lobi kantor cabang pembantu bank mitra ARU, serta memberikan pelayanan keamanan yang ramah bagi nasabah.\n\nTanggung Jawab:\n- Melakukan patroli rutin dan pengawasan keamanan di area lobi, parkir, dan ATM bank.\n- Membantu menyambut dan mengarahkan nasabah yang datang dengan sopan.\n- Menangani dan melaporkan jika terjadi indikasi gangguan keamanan kepada pihak berwenang.\n- Menjaga kebersihan dan ketertiban area pos penjagaan.",
                'requirements' => "Kualifikasi:\n- Pendidikan minimal SMA sederajat.\n- Memiliki sertifikat Gada Pratama aktif dari Polda setempat.\n- Tinggi badan minimal 168 cm dengan berat badan proporsional.\n- Memiliki kemampuan komunikasi yang baik dan ramah (customer service oriented).\n- Tidak memiliki tato/tindik dan sehat jasmani-rohani.",
                'location' => 'Jakarta Barat',
                'contract_type' => 'pkwt',
                'salary_range_min' => 4600000,
                'salary_range_max' => 4600000,
                'salary_visible' => true,
                'quota' => 5,
                'deadline_at' => now()->addDays(40),
                'status' => 'draft',
                'categories' => ['Security'],
            ],
            [
                'title' => 'Driver Operasional Logistik',
                'description' => "Mengemudikan truk engkel (CDE) atau mobil box operasional untuk mendistribusikan barang logistik kebutuhan cabang mitra ke area Jabodetabek.\n\nTanggung Jawab:\n- Mengemudikan kendaraan box operasional dengan aman mematuhi aturan lalu lintas.\n- Memastikan barang yang dimuat di kendaraan sesuai dengan surat jalan (dokumen pengiriman).\n- Melakukan pengecekan kondisi oli, air radiator, tekanan ban kendaraan secara rutin.\n- Melaporkan kendala pengiriman dan kerusakan unit kendaraan kepada koordinator logistik.",
                'requirements' => "Kualifikasi:\n- Pendidikan minimal SMP/SMA sederajat.\n- Memiliki SIM B1 Umum yang masih aktif.\n- Hafal rute jalan wilayah Jabodetabek dengan baik.\n- Berbadan sehat, jujur, bertanggung jawab, dan bebas narkoba.\n- Penempatan pool di Depok.",
                'location' => 'Depok',
                'contract_type' => 'pkwt',
                'salary_range_min' => 3800000,
                'salary_range_max' => 4500000,
                'salary_visible' => false,
                'quota' => 4,
                'deadline_at' => now()->subDays(2),
                'status' => 'closed',
                'categories' => ['Driver'],
            ]
        ];

        foreach ($jobs as $jobData) {
            $categoriesNames = $jobData['categories'];
            unset($jobData['categories']);

            $jobData['slug'] = Str::slug($jobData['title']);
            $jobData['created_by'] = $hr->id;

            $job = JobListing::create($jobData);

            $categoryIds = JobCategory::whereIn('name', $categoriesNames)->pluck('id');
            $job->categories()->attach($categoryIds);
        }
    }
}
