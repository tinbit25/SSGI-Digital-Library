<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users.
     * GET /api/admin/users
     */
    public function index(): JsonResponse
    {
        $users = User::with('role')->orderBy('first_name')->get();

        return response()->json([
            'success' => true,
            'data'    => UserResource::collection($users),
        ]);
    }

    /**
     * Update user role.
     * PUT /api/admin/users/{user}/role
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|string|exists:roles,name',
        ]);

        $role = Role::where('name', $validated['role'])->firstOrFail();
        $user->update(['role_id' => $role->id]);
        $user->syncRoles([$role->name]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully.',
            'data'    => new UserResource($user->fresh('role')),
        ]);
    }

    /**
     * Deactivate user account.
     * DELETE /api/admin/users/{user}
     */
    public function destroy(User $user): JsonResponse
    {
        $user->update(['status' => 'inactive']);

        return response()->json([
            'success' => true,
            'message' => 'User account deactivated.',
        ]);
    }
}
