<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    private const DEFAULT_CATEGORIES = [
        'Infrastructure', 'Design', 'Development', 'Communication',
        'Productivity', 'Project Management', 'Entertainment', 'Security',
    ];

    public function index(Request $request): JsonResponse
    {
        $custom = $request->user()->categories()->pluck('name')->toArray();

        return response()->json([
            'default' => self::DEFAULT_CATEGORIES,
            'custom'  => $custom,
            'all'     => array_merge(self::DEFAULT_CATEGORIES, $custom),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $name = trim($request->name);

        // Prevent duplicates (case-insensitive)
        $exists = $request->user()->categories()
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->exists();

        if ($exists || in_array($name, self::DEFAULT_CATEGORIES)) {
            return response()->json(['message' => 'Category already exists.'], 422);
        }

        $category = $request->user()->categories()->create(['name' => $name]);

        return response()->json(['category' => $category->name], 201);
    }

    public function destroy(Request $request, string $name): JsonResponse
    {
        $deleted = $request->user()->categories()
            ->whereRaw('LOWER(name) = ?', [strtolower($name)])
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Category not found.'], 404);
        }

        return response()->json(['message' => 'Category removed.']);
    }
}
