<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('renewal_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('renewal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_entries');
    }
};
