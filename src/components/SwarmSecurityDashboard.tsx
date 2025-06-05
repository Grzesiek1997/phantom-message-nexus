
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSwarmSecurity } from '@/hooks/useSwarmSecurity';
import { Bug, Zap, Eye, Waves, Brain, Target, Activity, Network } from 'lucide-react';

const SwarmSecurityDashboard: React.FC = () => {
  const { swarmIntelligence, optimizeCryptographyWithPSO, achieveSecurityConsensusWithFishSchooling, deployFlockingDefense } = useSwarmSecurity();

  const handleOptimizeCrypto = async () => {
    await optimizeCryptographyWithPSO({
      keySize: 4096,
      algorithm: 'CRYSTALS-Kyber',
      complexity: 10,
      entropySource: 'quantum-random'
    });
  };

  const handleSchoolingConsensus = async () => {
    const nodes = Array.from({ length: 10 }, (_, i) => ({
      id: `node-${i}`,
      position: [Math.random() * 100 - 50, Math.random() * 100 - 50] as [number, number],
      velocity: [Math.random() * 4 - 2, Math.random() * 4 - 2] as [number, number],
      trustScore: Math.random()
    }));

    await achieveSecurityConsensusWithFishSchooling(nodes);
  };

  const handleFlockingDefense = async () => {
    const threats = [
      {
        id: 'threat-1',
        type: 'ddos' as const,
        severity: 0.8,
        position: [Math.random() * 100 - 50, Math.random() * 100 - 50] as [number, number]
      }
    ];

    await deployFlockingDefense(threats);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {/* Collective Intelligence Overview */}
      <Card className="p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 col-span-full">
        <div className="flex items-center mb-4">
          <Brain className="w-6 h-6 text-purple-400 mr-3" />
          <h2 className="text-2xl font-bold text-white">🧠 Collective Swarm Intelligence</h2>
          <span className="ml-4 px-3 py-1 bg-purple-900/30 border border-purple-500/30 rounded-full text-purple-300 text-sm">
            Collective IQ: {(swarmIntelligence.collectiveIQ * 100).toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🐜</div>
            <div className="text-sm text-gray-300">Ant Colony</div>
            <Progress value={swarmIntelligence.antColonyOptimization.pathOptimization * 100} className="mt-2" />
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-sm text-gray-300">Particle Swarm</div>
            <Progress value={swarmIntelligence.particleSwarmOptimization.globalBestFitness * 100} className="mt-2" />
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🐝</div>
            <div className="text-sm text-gray-300">Bee Algorithm</div>
            <Progress value={swarmIntelligence.beeAlgorithmResults.nectarQuality * 100} className="mt-2" />
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🐟</div>
            <div className="text-sm text-gray-300">Flocking</div>
            <Progress value={swarmIntelligence.flockingBehavior.emergentIntelligence * 100} className="mt-2" />
          </div>
        </div>
      </Card>

      {/* Ant Colony Optimization */}
      <Card className="p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🐜 Ant Colony Security</h3>
          <Bug className="w-6 h-6 text-red-400" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Path Optimization</span>
            <span className="text-red-300 font-mono">
              {(swarmIntelligence.antColonyOptimization.pathOptimization * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.antColonyOptimization.pathOptimization * 100} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Pheromone Strength</span>
            <span className="text-red-300 font-mono">
              {(swarmIntelligence.antColonyOptimization.pheromoneStrength * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.antColonyOptimization.pheromoneStrength * 100} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Scout Efficiency</span>
            <span className="text-red-300 font-mono">
              {(swarmIntelligence.antColonyOptimization.scoutEfficiency * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.antColonyOptimization.scoutEfficiency * 100} className="h-2" />
        </div>
        
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="text-xs text-red-300 mb-2">🔍 Active Scouts</div>
          <div className="text-sm text-gray-300">
            • Threat vector mapping: {swarmIntelligence.antColonyOptimization.convergenceTime}ms
            • Pheromone trail analysis
            • Optimal defense path discovery
          </div>
        </div>
      </Card>

      {/* Particle Swarm Optimization */}
      <Card className="p-6 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">⚡ Particle Swarm Crypto</h3>
          <Zap className="w-6 h-6 text-blue-400" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Global Best Fitness</span>
            <span className="text-blue-300 font-mono">
              {(swarmIntelligence.particleSwarmOptimization.globalBestFitness * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.particleSwarmOptimization.globalBestFitness * 100} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Convergence Rate</span>
            <span className="text-blue-300 font-mono">
              {(swarmIntelligence.particleSwarmOptimization.convergenceRate * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.particleSwarmOptimization.convergenceRate * 100} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Swarm Coherence</span>
            <span className="text-blue-300 font-mono">
              {(swarmIntelligence.particleSwarmOptimization.swarmCoherence * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.particleSwarmOptimization.swarmCoherence * 100} className="h-2" />
        </div>
        
        <Button 
          onClick={handleOptimizeCrypto}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          Optimize Cryptography
        </Button>
      </Card>

      {/* Bee Algorithm */}
      <Card className="p-6 bg-gradient-to-r from-yellow-900/20 to-amber-900/20 border-yellow-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🐝 Bee Algorithm Hive</h3>
          <Target className="w-6 h-6 text-yellow-400" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Nectar Quality</span>
            <span className="text-yellow-300 font-mono">
              {(swarmIntelligence.beeAlgorithmResults.nectarQuality * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.beeAlgorithmResults.nectarQuality * 100} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Flower Diversity</span>
            <span className="text-yellow-300 font-mono">
              {(swarmIntelligence.beeAlgorithmResults.flowerDiversity * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.beeAlgorithmResults.flowerDiversity * 100} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Hive Productivity</span>
            <span className="text-yellow-300 font-mono">
              {(swarmIntelligence.beeAlgorithmResults.hiveProductivity * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.beeAlgorithmResults.hiveProductivity * 100} className="h-2" />
        </div>
        
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="text-xs text-yellow-300 mb-2">🌸 Defense Flowers Found</div>
          <div className="text-sm text-gray-300">
            • Firewall optimization flowers
            • Intrusion detection nectar
            • Encryption strength blooms
          </div>
        </div>
      </Card>

      {/* Flocking Behavior */}
      <Card className="p-6 bg-gradient-to-r from-green-900/20 to-teal-900/20 border-green-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🐟 Flocking Defense</h3>
          <Waves className="w-6 h-6 text-green-400" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Alignment</span>
            <span className="text-green-300 font-mono">
              {(swarmIntelligence.flockingBehavior.alignment * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.flockingBehavior.alignment * 100} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Cohesion</span>
            <span className="text-green-300 font-mono">
              {(swarmIntelligence.flockingBehavior.cohesion * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.flockingBehavior.cohesion * 100} className="h-2" />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Emergent Intelligence</span>
            <span className="text-green-300 font-mono">
              {(swarmIntelligence.flockingBehavior.emergentIntelligence * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={swarmIntelligence.flockingBehavior.emergentIntelligence * 100} className="h-2" />
        </div>
        
        <Button 
          onClick={handleFlockingDefense}
          className="w-full mt-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
        >
          <Waves className="w-4 h-4 mr-2" />
          Deploy Flocking Defense
        </Button>
      </Card>

      {/* Consensus Protocols */}
      <Card className="p-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">🏛️ Swarm Consensus</h3>
          <Network className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="space-y-4">
          <div className="p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
            <div className="text-sm font-semibold text-indigo-300 mb-2">Fish Schooling Consensus</div>
            <div className="text-xs text-gray-300 mb-2">
              Distributed security decision making through collective behavior
            </div>
            <Button 
              onClick={handleSchoolingConsensus}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              size="sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Achieve Consensus
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="text-indigo-300 font-mono text-lg">
                {Math.floor(swarmIntelligence.collectiveIQ * 47)}
              </div>
              <div className="text-gray-400">Active Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-indigo-300 font-mono text-lg">
                {Math.floor(swarmIntelligence.collectiveIQ * 1000)}ms
              </div>
              <div className="text-gray-400">Consensus Time</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Swarm Performance Metrics */}
      <Card className="p-6 col-span-full bg-gradient-to-r from-gray-900/20 to-slate-900/20 border-gray-500/30">
        <div className="flex items-center mb-4">
          <Eye className="w-5 h-5 text-cyan-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">📊 Swarm Performance Analytics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-cyan-300">
              {(swarmIntelligence.collectiveIQ * 100).toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">Collective IQ Score</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-green-300">
              {Math.floor(swarmIntelligence.antColonyOptimization.convergenceTime)}ms
            </div>
            <div className="text-xs text-gray-400">Avg Response Time</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-300">
              {(swarmIntelligence.particleSwarmOptimization.optimizationEfficiency * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Optimization Efficiency</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-300">
              {(swarmIntelligence.flockingBehavior.emergentIntelligence * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">Emergent Intelligence</div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-lg">
          <div className="text-sm font-semibold text-cyan-300 mb-2">🧠 Emergent Behaviors Detected:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-300">
            <div>• Self-organizing defense clusters forming</div>
            <div>• Adaptive threat hunting patterns emerging</div>
            <div>• Collective decision-making protocols active</div>
            <div>• Swarm-based pattern recognition online</div>
            <div>• Distributed consensus mechanisms operational</div>
            <div>• Emergent cryptographic optimization detected</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SwarmSecurityDashboard;
