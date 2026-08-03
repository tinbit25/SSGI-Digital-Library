<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Category;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
        ]);

        $adminRole = Role::where('name', 'Administrator')->first();
        $librarianRole = Role::where('name', 'Librarian')->first();
        $staffRole = Role::where('name', 'Staff')->first();
        $guestRole = Role::where('name', 'Guest')->first();

        // Create Default Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@ssgi.gov.et'],
            [
                'role_id' => $adminRole->id,
                'first_name' => 'System',
                'last_name' => 'Administrator',
                'password' => bcrypt('password123'),
                'status' => 'active',
            ]
        );
        $admin->assignRole($adminRole);

        $librarian = User::firstOrCreate(
            ['email' => 'librarian@ssgi.gov.et'],
            [
                'role_id' => $librarianRole->id,
                'first_name' => 'Chief',
                'last_name' => 'Librarian',
                'password' => bcrypt('password123'),
                'status' => 'active',
            ]
        );
        $librarian->assignRole($librarianRole);

        $staff = User::firstOrCreate(
            ['email' => 'staff@ssgi.gov.et'],
            [
                'role_id' => $staffRole->id,
                'first_name' => 'Researcher',
                'last_name' => 'Staff',
                'password' => bcrypt('password123'),
                'status' => 'active',
            ]
        );
        $staff->assignRole($staffRole);

        $guest = User::firstOrCreate(
            ['email' => 'guest@ssgi.gov.et'],
            [
                'role_id' => $guestRole->id,
                'first_name' => 'Trainee',
                'last_name' => 'Guest',
                'password' => bcrypt('password123'),
                'status' => 'active',
            ]
        );
        $guest->assignRole($guestRole);

        // Seed Sample Categories
        $categories = [
            'Space Science & Astronomy',
            'Geospatial & Remote Sensing',
            'Satellite Engineering',
            'Institutional Reports & Bulletins',
        ];

        foreach ($categories as $catName) {
            Category::firstOrCreate(
                ['name' => $catName],
                ['description' => "Official digital assets under {$catName}."]
            );
        }
    }
}
