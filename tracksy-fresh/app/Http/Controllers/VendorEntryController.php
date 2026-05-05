<?php

namespace App\Http\Controllers;

use App\Http\Requests\VendorEntryRequest;
use App\Http\Resources\VendorEntryResource;
use App\Models\Renewal;
use App\Models\VendorEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VendorEntryController extends Controller
{
    public function index(Renewal $renewal): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [VendorEntry::class, $renewal]);

        $entries = $renewal->vendorEntries()->with('fields')->get();

        return VendorEntryResource::collection($entries);
    }

    public function store(VendorEntryRequest $request, Renewal $renewal): JsonResponse
    {
        $this->authorize('store', [VendorEntry::class, $renewal]);

        $entry = $renewal->vendorEntries()->create([
            'name'  => $request->name,
            'notes' => $request->notes,
        ]);

        $this->syncFields($entry, $request->fields ?? []);

        return response()->json(new VendorEntryResource($entry->load('fields')), 201);
    }

    public function update(VendorEntryRequest $request, Renewal $renewal, VendorEntry $entry): JsonResponse
    {
        $this->authorize('update', $entry);

        $entry->update([
            'name'  => $request->name,
            'notes' => $request->notes,
        ]);

        $this->syncFields($entry, $request->fields ?? []);

        return response()->json(new VendorEntryResource($entry->load('fields')));
    }

    public function destroy(Renewal $renewal, VendorEntry $entry): JsonResponse
    {
        $this->authorize('delete', $entry);

        $entry->delete();

        return response()->json(null, 204);
    }

    private function syncFields(VendorEntry $entry, array $fields): void
    {
        $entry->fields()->delete();

        $rows = array_map(fn($field, $idx) => [
            'vendor_entry_id' => $entry->id,
            'label'           => $field['label'],
            'value'           => $field['value'] ?? null,
            'sort_order'      => $field['sort_order'] ?? $idx,
            'created_at'      => now(),
            'updated_at'      => now(),
        ], $fields, array_keys($fields));

        if (!empty($rows)) {
            \App\Models\VendorField::insert($rows);
        }
    }
}
