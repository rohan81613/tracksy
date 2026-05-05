<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('renewals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('vendor');
            $table->decimal('amount', 10, 2);
            $table->enum('billing_cycle', ['monthly', 'yearly'])->default('yearly');
            $table->date('purchase_date')->nullable();
            $table->date('renewal_date');
            $table->integer('reminder_days')->default(7);
            $table->string('category')->nullable();
            $table->string('currency', 10)->default('USD');
            $table->text('notes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('renewals');
    }
};
