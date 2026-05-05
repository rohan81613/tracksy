<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_entry_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->string('value', 1000)->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index('vendor_entry_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_fields');
    }
};
