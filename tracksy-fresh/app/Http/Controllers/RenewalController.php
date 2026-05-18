<?php

namespace App\Http\Controllers;

use App\Http\Requests\RenewalRequest;
use App\Http\Resources\RenewalResource;
use App\Models\Renewal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RenewalController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = $request->user()->renewals();

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('vendor', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->query('status')) {
            match ($status) {
                'overdue'   => $query->overdue(),
                'upcoming'  => $query->upcoming(),
                'due-today' => $query->whereDate('renewal_date', today()),
                'active'    => $query->where('renewal_date', '>', today()->addDays(30)),
                default     => null,
            };
        }

        // Category filter
        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        // Sorting
        $sortBy  = $request->query('sort_by', 'renewal_date');
        $sortDir = $request->query('sort_dir', 'asc');
        $allowed = ['name', 'vendor', 'amount', 'renewal_date', 'created_at'];

        if (in_array($sortBy, $allowed)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        return RenewalResource::collection($query->get());
    }

    public function store(RenewalRequest $request): JsonResponse
    {
        $renewal = $request->user()->renewals()->create($request->validated());

        return response()->json(new RenewalResource($renewal), 201);
    }

    public function show(Request $request, Renewal $renewal): JsonResponse
    {
        $this->authorize('view', $renewal);

        return response()->json(new RenewalResource($renewal));
    }

    public function update(RenewalRequest $request, Renewal $renewal): JsonResponse
    {
        $this->authorize('update', $renewal);

        $renewal->update($request->validated());

        return response()->json(new RenewalResource($renewal->fresh()));
    }

    public function destroy(Request $request, Renewal $renewal): JsonResponse
    {
        $this->authorize('delete', $renewal);

        $renewal->delete();

        return response()->json(['message' => 'Renewal deleted successfully.']);
    }

    public function stats(Request $request): JsonResponse
    {
        $renewals = $request->user()->renewals();

        $total    = (clone $renewals)->count();
        $upcoming = (clone $renewals)->upcoming()->count();
        $overdue  = (clone $renewals)->overdue()->count();

        $monthlySpend = (clone $renewals)->get()->sum(function ($r) {
            return $r->monthly_amount;
        });

        return response()->json([
            'total'         => $total,
            'upcoming'      => $upcoming,
            'overdue'       => $overdue,
            'monthly_spend' => round($monthlySpend, 2),
        ]);
    }

    public function bulkImport(Request $request): JsonResponse
    {
        $request->validate([
            'renewals'                    => ['required', 'array', 'min:1', 'max:500'],
            'renewals.*.name'             => ['required', 'string', 'max:255'],
            'renewals.*.vendor'           => ['required', 'string', 'max:255'],
            'renewals.*.amount'           => ['required', 'numeric', 'min:0'],
            'renewals.*.amount_inr'       => ['nullable', 'numeric', 'min:0'],
            'renewals.*.billing_cycle'    => ['required', 'in:monthly,yearly'],
            'renewals.*.renewal_date'     => ['required', 'date'],
            'renewals.*.reminder_days'    => ['nullable', 'integer', 'min:0'],
            'renewals.*.purchase_date'    => ['nullable', 'date'],
            'renewals.*.category'         => ['nullable', 'string', 'max:100'],
            'renewals.*.notes'            => ['nullable', 'string', 'max:2000'],
        ]);

        $created = collect($request->renewals)->map(function ($data) use ($request) {
            return $request->user()->renewals()->create([
                'name'          => $data['name'],
                'vendor'        => $data['vendor'],
                'amount'        => $data['amount'],
                'amount_inr'    => $data['amount_inr'] ?? null,
                'billing_cycle' => $data['billing_cycle'],
                'renewal_date'  => $data['renewal_date'],
                'reminder_days' => $data['reminder_days'] ?? 7,
                'purchase_date' => $data['purchase_date'] ?? null,
                'category'      => $data['category'] ?? null,
                'notes'         => $data['notes'] ?? null,
            ]);
        });

        return response()->json([
            'message'  => "{$created->count()} renewals imported successfully.",
            'imported' => $created->count(),
        ], 201);
    }
}
