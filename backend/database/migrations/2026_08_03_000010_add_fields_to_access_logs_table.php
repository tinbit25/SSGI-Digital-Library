<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('access_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('resource_id')->nullable()->after('user_id');
            $table->string('ip_address')->after('action');
            $table->string('user_agent')->nullable()->after('ip_address');
            $table->index('action');
            $table->foreign('resource_id')->references('id')->on('resources')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('access_logs', function (Blueprint $table) {
            $table->dropForeign(['resource_id']);
            $table->dropColumn(['resource_id', 'ip_address', 'user_agent']);
            $table->dropIndex(['action']);
        });
    }
};
