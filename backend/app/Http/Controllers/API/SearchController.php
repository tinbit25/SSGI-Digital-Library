<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\SemanticSearchService;
use App\Models\AccessLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    protected SemanticSearchService $semanticSearchService;

    public function __construct(SemanticSearchService $semanticSearchService)
    {
        $this->semanticSearchService = $semanticSearchService;
    }

    /**
     * GET /api/search?q=...
     */
    public function index(Request $request)
    {
        $query = $request->query('q', '');
        if (trim($query) === '') {
            return response()->json([
                'success' => false,
                'message' => 'Query parameter "q" is required.',
                'data'    => [],
            ], 400);
        }

        $results = $this->semanticSearchService->search($query);

        // Log the search (authenticated user may be null for guests, but auth middleware ensures user)
        $user = Auth::user();
        AccessLog::create([
            'user_id'    => $user ? $user->id : null,
            'resource_id'=> null,
            'action'     => 'SEARCH',
            'ip_address' => $request->ip(),
            'user_agent' => $request->header('User-Agent'),
        ]);

        if (empty($results)) {
            return response()->json([
                'success' => true,
                'message' => 'No matching resources found.',
                'data'    => [],
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Search completed.',
            'data'    => $results,
        ]);
    }
}
?>
