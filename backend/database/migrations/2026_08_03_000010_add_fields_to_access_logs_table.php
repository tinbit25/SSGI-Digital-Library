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
            if (!Schema::hasColumn('access_logs', 'resource_id')) {
                $table->foreignId('resource_id')->nullable()->constrained('resources')->onDelete('set null')->after('user_id');
            }
            if (!Schema::hasColumn('access_logs', 'ip_address')) {
                $table->string('ip_address')->nullable()->after('action');
            }
            if (!Schema::hasColumn('access_logs', 'user_agent')) {
                $table->string('user_agent')->nullable()->after('ip_address');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('access_logs', function (Blueprint $table) {
            if (Schema::hasColumn('access_logs', 'user_agent')) {
                $table->dropColumn('user_agent');
            }
        });
    }
};
