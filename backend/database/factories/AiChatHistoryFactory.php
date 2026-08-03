<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AiChatHistory>
 */
class AiChatHistoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'question' => fake()->sentence() . '?',
            'answer' => fake()->paragraph(2),
        ];
    }
}
