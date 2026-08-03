<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Resource;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ResourceChunk>
 */
class ResourceChunkFactory extends Factory
{
    public function definition(): array
    {
        return [
            'resource_id' => Resource::factory(),
            'chunk_index' => fake()->numberBetween(0, 100),
            'page_number' => fake()->numberBetween(1, 50),
            'chunk_text' => fake()->paragraph(3),
            'vector_id' => fake()->uuid(),
        ];
    }
}
