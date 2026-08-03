<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Define system permissions
        $permissions = [
            'manage users',
            'manage resources',
            'view reports',
            'upload resources',
            'update resources',
            'manage categories',
            'view resources',
            'view public resources',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName, 'guard_name' => 'web']);
        }

        // Define default roles
        $roles = [
            [
                'name' => 'Administrator',
                'description' => 'Full system access, user management, and activity monitoring.',
                'guard_name' => 'web',
                'permissions' => [
                    'manage users',
                    'manage resources',
                    'view reports',
                    'upload resources',
                    'update resources',
                    'manage categories',
                    'view resources',
                    'view public resources',
                ],
            ],
            [
                'name' => 'Librarian',
                'description' => 'Document upload, category management, feedback review, and notification broadcasting.',
                'guard_name' => 'web',
                'permissions' => [
                    'upload resources',
                    'update resources',
                    'manage categories',
                    'view resources',
                    'view public resources',
                ],
            ],
            [
                'name' => 'Staff',
                'description' => 'SSGI staff member with search, authorized document reading, AI assistant, and feedback capabilities.',
                'guard_name' => 'web',
                'permissions' => [
                    'view resources',
                    'view public resources',
                ],
            ],
            [
                'name' => 'Guest',
                'description' => 'Trainee / Guest with search, permitted document reading, AI assistant, and feedback capabilities.',
                'guard_name' => 'web',
                'permissions' => [
                    'view public resources',
                ],
            ],
        ];

        foreach ($roles as $roleData) {
            $rolePermissions = $roleData['permissions'];
            unset($roleData['permissions']);

            $role = Role::firstOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );

            $role->syncPermissions($rolePermissions);
        }
    }
}
