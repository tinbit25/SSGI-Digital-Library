<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AccessLog;
use App\Models\Resource;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    /**
     * Get system usage and activity report.
     * GET /api/admin/reports
     */
    public function index(): JsonResponse
    {
        $totalUsers = User::count();
        $totalResources = Resource::count();
        $totalCategories = Category::count();
        $totalViews = AccessLog::where('action', 'view')->orWhere('action', 'view_pdf')->count();
        $totalSearches = AccessLog::where('action', 'SEARCH')->count();

        return response()->json([
            'success' => true,
            'data'    => [
                'total_users'      => $totalUsers,
                'total_resources'  => $totalResources,
                'total_categories' => $totalCategories,
                'total_views'      => $totalViews,
                'total_searches'   => $totalSearches,
            ],
        ]);
    }

    /**
     * Get access logs.
     * GET /api/admin/reports/access-logs
     */
    public function accessLogs(Request $request): JsonResponse
    {
        $logs = AccessLog::with(['user', 'resource'])
            ->latest()
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data'    => $logs->items(),
            'meta'    => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }
}
