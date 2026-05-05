<?php

namespace Tests\Unit;

use App\Models\Renewal;
use App\Models\User;
use App\Models\VendorEntry;
use App\Models\VendorField;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorEntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_entry_belongs_to_renewal(): void
    {
        $user    = User::factory()->create();
        $renewal = Renewal::factory()->create(['user_id' => $user->id]);
        $entry   = VendorEntry::create(['renewal_id' => $renewal->id, 'name' => 'Acme']);

        $this->assertInstanceOf(Renewal::class, $entry->renewal);
        $this->assertEquals($renewal->id, $entry->renewal->id);
    }

    public function test_vendor_entry_has_many_fields_ordered_by_sort_order(): void
    {
        $user    = User::factory()->create();
        $renewal = Renewal::factory()->create(['user_id' => $user->id]);
        $entry   = VendorEntry::create(['renewal_id' => $renewal->id, 'name' => 'Acme']);

        VendorField::create(['vendor_entry_id' => $entry->id, 'label' => 'B', 'value' => '2', 'sort_order' => 1]);
        VendorField::create(['vendor_entry_id' => $entry->id, 'label' => 'A', 'value' => '1', 'sort_order' => 0]);

        $fields = $entry->fields;
        $this->assertCount(2, $fields);
        $this->assertEquals('A', $fields[0]->label);
        $this->assertEquals('B', $fields[1]->label);
    }

    public function test_vendor_field_belongs_to_vendor_entry(): void
    {
        $user    = User::factory()->create();
        $renewal = Renewal::factory()->create(['user_id' => $user->id]);
        $entry   = VendorEntry::create(['renewal_id' => $renewal->id, 'name' => 'Acme']);
        $field   = VendorField::create(['vendor_entry_id' => $entry->id, 'label' => 'Website', 'value' => 'https://acme.com', 'sort_order' => 0]);

        $this->assertInstanceOf(VendorEntry::class, $field->vendorEntry);
        $this->assertEquals($entry->id, $field->vendorEntry->id);
    }

    public function test_renewal_has_many_vendor_entries_ordered_by_created_at(): void
    {
        $user    = User::factory()->create();
        $renewal = Renewal::factory()->create(['user_id' => $user->id]);

        $e1 = VendorEntry::create(['renewal_id' => $renewal->id, 'name' => 'First']);
        $e2 = VendorEntry::create(['renewal_id' => $renewal->id, 'name' => 'Second']);

        $entries = $renewal->vendorEntries;
        $this->assertCount(2, $entries);
        $this->assertEquals('First', $entries[0]->name);
        $this->assertEquals('Second', $entries[1]->name);
    }

    public function test_deleting_vendor_entry_cascades_to_fields(): void
    {
        $user    = User::factory()->create();
        $renewal = Renewal::factory()->create(['user_id' => $user->id]);
        $entry   = VendorEntry::create(['renewal_id' => $renewal->id, 'name' => 'Acme']);
        VendorField::create(['vendor_entry_id' => $entry->id, 'label' => 'Phone', 'value' => '123', 'sort_order' => 0]);

        $entry->delete();

        $this->assertDatabaseMissing('vendor_fields', ['vendor_entry_id' => $entry->id]);
    }
}
